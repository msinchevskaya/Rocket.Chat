import { Box } from '@rocket.chat/fuselage';
import React, { ComponentProps, ReactElement } from 'react';

const AttachmentDescription = ({ ...props }: ComponentProps<typeof Box>): ReactElement => (
	<Box rcx-attachment__description mbe='x4' {...props} />
);

export default AttachmentDescription;
