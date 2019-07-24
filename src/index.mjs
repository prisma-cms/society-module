
import Module from "./modules";

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
  TournamentGroupModule,
  TournamentModule,
  TourneyModule,
  GameModule,
  GameResultModule,
  // GameRoundModule,
];


export default Module
