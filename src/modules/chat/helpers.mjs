

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
  } = currentUser || {};


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
  }


  return {
    OR,
    AND: where ? {
      ...where,
    } : undefined,
  };
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
  } = currentUser || {};


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

  // console.log("prepareAccesibleMessagesQuery OR", OR);

  return {
    OR,
    AND: where ? {
      ...where,
    } : undefined,
  };
}

