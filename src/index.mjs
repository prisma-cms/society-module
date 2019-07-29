
import Module from "./modules";


import ChatRoomModule, {
  ChatRoomProcessor,
} from "./modules/chat/ChatRoom";

export {
  ChatRoomModule,
  ChatRoomProcessor,
};


import ChatMessageModule, {
  ChatMessageProcessor,
} from "./modules/chat/ChatMessage";

export {
  ChatMessageModule,
  ChatMessageProcessor,
};


import ChatMessageReadedModule, {
  ChatMessageReadedProcessor,
} from "./modules/chat/ChatMessageReaded";

export {
  ChatMessageReadedModule,
  ChatMessageReadedProcessor,
};


import TournamentGroupModule, {
  TournamentGroupProcessor,
} from "./modules/TournamentGroup";

export {
  TournamentGroupModule,
  TournamentGroupProcessor,
};

import TournamentModule, {
  TournamentProcessor,
} from "./modules/Tournament";

export {
  TournamentModule,
  TournamentProcessor,
};


import TourneyModule, {
  TourneyProcessor,
} from "./modules/Tourney";

export {
  TourneyModule,
  TourneyProcessor,
};


import GameModule, {
  GameProcessor,
} from "./modules/Game";

export {
  GameModule,
  GameProcessor,
};


import GameResultModule, {
  GameResultProcessor,
} from "./modules/GameResult";

export {
  GameResultModule,
  GameResultProcessor,
};


// import GameRoundModule, {
//   GameRoundProcessor,
// } from "./modules/GameRound";

// export {
//   GameRoundModule,
//   GameRoundProcessor,
// };


export const Modules = [
  ChatRoomModule,
  ChatMessageModule,
  ChatMessageReadedModule,
  TournamentGroupModule,
  TournamentModule,
  TourneyModule,
  GameModule,
  GameResultModule,
  // GameRoundModule,
];


export default Module
