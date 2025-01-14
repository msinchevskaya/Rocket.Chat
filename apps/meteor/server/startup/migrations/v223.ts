import { Permissions } from '@rocket.chat/models';

import { addMigration } from '../../lib/migrations';

const roleId = 'user';

addMigration({
	version: 223,
	up() {
		return Permissions.update({ _id: 'message-impersonate' }, { $addToSet: { roles: roleId } });
	},
});
