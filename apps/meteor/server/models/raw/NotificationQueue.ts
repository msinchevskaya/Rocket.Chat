import type { INotification, RocketChatRecordDeleted } from '@rocket.chat/core-typings';
import type { INotificationQueueModel } from '@rocket.chat/model-typings';
import type { Collection, Db, IndexSpecification, UpdateWriteOpResult } from 'mongodb';
import { getCollectionName } from '@rocket.chat/models';

import { BaseRaw } from './BaseRaw';

export class NotificationQueueRaw extends BaseRaw<INotification> implements INotificationQueueModel {
	constructor(db: Db, trash?: Collection<RocketChatRecordDeleted<INotification>>) {
		super(db, getCollectionName('notification_queue'), trash);
	}

	protected modelIndexes(): IndexSpecification[] {
		return [
			{ key: { uid: 1 } },
			{ key: { ts: 1 }, expireAfterSeconds: 2 * 60 * 60 },
			{ key: { schedule: 1 }, sparse: true },
			{ key: { sending: 1 }, sparse: true },
			{ key: { error: 1 }, sparse: true },
		];
	}

	unsetSendingById(_id: string): Promise<UpdateWriteOpResult> {
		return this.updateOne(
			{ _id },
			{
				$unset: {
					sending: 1,
				},
			},
		);
	}

	setErrorById(_id: string, error: any): Promise<UpdateWriteOpResult> {
		return this.updateOne(
			{
				_id,
			},
			{
				$set: {
					error,
				},
				$unset: {
					sending: 1,
				},
			},
		);
	}

	clearScheduleByUserId(uid: string): Promise<UpdateWriteOpResult> {
		return this.updateMany(
			{
				uid,
				schedule: { $exists: true },
			},
			{
				$unset: {
					schedule: 1,
				},
			},
		);
	}

	async clearQueueByUserId(uid: string): Promise<number | undefined> {
		const op = await this.deleteMany({
			uid,
		});

		return op.deletedCount;
	}

	async findNextInQueueOrExpired(expired: Date): Promise<INotification | undefined> {
		const now = new Date();

		const result = await this.col.findOneAndUpdate(
			{
				$and: [
					{
						$or: [{ sending: { $exists: false } }, { sending: { $lte: expired } }],
					},
					{
						$or: [{ schedule: { $exists: false } }, { schedule: { $lte: now } }],
					},
					{
						error: { $exists: false },
					},
				],
			},
			{
				$set: {
					sending: now,
				},
			},
			{
				sort: {
					ts: 1,
				},
			},
		);

		return result.value;
	}
}
