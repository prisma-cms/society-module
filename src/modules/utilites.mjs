
export const getUserId = async function (ctx, token) {

  const {
    currentUser,
  } = ctx;

  return currentUser && currentUser.id || null;
}