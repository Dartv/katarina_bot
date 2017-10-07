import R from 'ramda';

export const isImageOwner = ({ user, image }) => R.eqProps('id', user, image.user);

export const isAdmin = ({ message: { member } }) => member.hasPermission('ADMINISTRATOR');
