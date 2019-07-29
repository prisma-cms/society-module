

/**
 * Получаем только публичные комнаты или в которых пользователь состоит
 */
export const prepareAccesibleRoomsQuery = function (args, ctx) {

  let {
    where,
  } = args;

  const {
    currentUser,
  } = ctx;

  const {
    id: currentUserId,
    sudo,
  } = currentUser || {};


  if (!sudo) {

    let OR = [
      {
        isPublic: true,
      },
    ];

    if (currentUserId) {

      OR.push({
        Members_some: {
          id: currentUserId,
        },
      });

      OR.push({
        Invitations_some: {
          User: {
            id: currentUserId,
          }
        },
      });

    }

    where = {
      OR,
      AND: where ? {
        ...where,
      } : undefined,
    };

  }


  // console.log("prepareAccesibleRoomsQuery where", JSON.stringify(where, true, 2));

  return where;
}


/**
 * Получаем только доступные сообщения
 */
export const prepareAccesibleMessagesQuery = function (args, ctx) {

  let {
    where,
  } = args;

  const {
    currentUser,
  } = ctx;

  const {
    id: currentUserId,
    sudo,
  } = currentUser || {};


  if (!sudo) {

    let OR = [
      {
        Room: prepareAccesibleRoomsQuery({}, ctx),
      }
    ];

    if (currentUserId) {
      OR.push({
        CreatedBy: {
          id: currentUserId,
        },
      });
    }


    // console.log("prepareAccesibleMessagesQuery OR", JSON.stringify(OR, true, 2));

    where = {
      OR,
      AND: where ? {
        ...where,
      } : undefined,
    };

    // console.log("prepareAccesibleMessagesQuery where", JSON.stringify(where, true, 2));

  }

  return where;
}

/**
 * Получаем только свои уведомления
 */
export const prepareAccesibleNoticesQuery = function (args, ctx) {

  let {
    where,
  } = args;

  const {
    currentUser,
  } = ctx;

  const {
    id: currentUserId,
  } = currentUser || {};


  let OR = [
  ];

  if (currentUserId) {
    OR.push({
      User: {
        id: currentUserId,
      },
    });
  }
  else {
    OR.push({
      id: null,
    });
  }

  // console.log("prepareAccesibleMessagesQuery OR", OR);

  return {
    OR,
    AND: where ? {
      ...where,
    } : undefined,
  };
}
