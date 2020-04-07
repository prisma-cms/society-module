1.8.0
===============================
- Added ChatRoom::allowAnonymous
- Added ChatRoom::sandbox
- Added User::acceptChatMessageAnonymous
- Added User::acceptChatMessageNewRoom
- Improved anonymous messages

1.7.0
===============================
- Update schema

1.6.0
===============================
- Breaking changes: Resource::CommentTarget renamed to Resource::Topic

1.5.6
===============================
- Remove resources resolvers

1.5.5
===============================
- Added TourneyPlayer

1.5.4
===============================
- Remove @prisma-cms/user-module from prod
- Remove Query::chatMessageReadedsConnection
- Remove Query::chatMessageReaded

1.5.3
===============================
- Added Tourney::date_till

1.5.2
===============================
- Check permissions on chatMessage subscription

1.5.1
===============================
- Fix chatRoom subscription

1.5.0
===============================
- Code refactoring

1.4.2
===============================
- Became ChatMessage::Room not required

1.4.1
===============================
- Fix create new ChatRoom

1.4.0
===============================
- Allow anonymous messages

1.3.9
===============================
- Fix search room for new message

1.3.8
===============================
- Added NotificationType::code

1.3.7
===============================
- Fix notice subscription

1.3.6
===============================
- Fix createChatMessage
- Added CreateChatMessage::CreatedBy

1.3.5
===============================
- Fix notice subscribe
- Fix markAsReadedChatMessage

1.3.4
===============================
- Make Resource::rating not required
- Make Resource::positiveVotesCount not required
- Make Resource::negativeVotesCount not required
- Make Resource::neutralVotesCount not required

1.3.3
===============================
- Added join room

1.3.2
===============================
- Added ChatRoomInvitation

1.3.1
===============================
- Added ChatMessage::markAsReaded()

1.3.0
===============================
- Added chat

1.2.3
===============================
- getApiSchema() now get prisma schema from current module dir only

1.2.2
===============================
- Added NotificationTypes relations

1.2.1
===============================
- Added Query resolvers

1.2.0
===============================
- Added schema

1.1.5
===============================
- Upgraded nodemon

1.1.4
===============================
- getApiSchema() now get prisma schema from current module dir only

1.1.3
===============================
- Move tests

1.1.2
===============================
- Upgrade dependencies

1.1.1
===============================
- Added nodemon and start-dev command

1.1.0
===============================
- Upgrade modules

1.0.0
===============================
- First release
