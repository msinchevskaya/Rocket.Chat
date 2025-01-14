import { Permissions } from '@rocket.chat/models';

import { addMigration } from '../../lib/migrations';

addMigration({
	version: 228,
	up() {
		return Permissions.update({ _id: 'manage-livechat-canned-responses' }, { $addToSet: { roles: 'livechat-monitor' } });
	},
});
