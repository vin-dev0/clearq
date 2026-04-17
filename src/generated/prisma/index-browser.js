
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  emailVerified: 'emailVerified',
  name: 'name',
  image: 'image',
  passwordHash: 'passwordHash',
  avatar: 'avatar',
  role: 'role',
  plan: 'plan',
  department: 'department',
  phone: 'phone',
  timezone: 'timezone',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLoginAt: 'lastLoginAt',
  organizationId: 'organizationId',
  subscriptionStatus: 'subscriptionStatus',
  trialEndsAt: 'trialEndsAt',
  subscriptionEndsAt: 'subscriptionEndsAt',
  gracePeriodEndsAt: 'gracePeriodEndsAt',
  lastPaymentAt: 'lastPaymentAt',
  stripeCustomerId: 'stripeCustomerId',
  stripeSubscriptionId: 'stripeSubscriptionId',
  twoFactorCode: 'twoFactorCode',
  twoFactorCodeExpires: 'twoFactorCodeExpires'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  logo: 'logo',
  domain: 'domain',
  settings: 'settings',
  isDemo: 'isDemo',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  plan: 'plan',
  subscriptionStatus: 'subscriptionStatus',
  trialEndsAt: 'trialEndsAt',
  subscriptionEndsAt: 'subscriptionEndsAt',
  clientFeePaid: 'clientFeePaid',
  gracePeriodEndsAt: 'gracePeriodEndsAt',
  stripeCustomerId: 'stripeCustomerId',
  stripeSubscriptionId: 'stripeSubscriptionId',
  stripeApiKey: 'stripeApiKey'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  color: 'color',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamMemberScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  teamId: 'teamId',
  role: 'role',
  joinedAt: 'joinedAt'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  number: 'number',
  subject: 'subject',
  description: 'description',
  status: 'status',
  priority: 'priority',
  type: 'type',
  channel: 'channel',
  creatorId: 'creatorId',
  assigneeId: 'assigneeId',
  teamId: 'teamId',
  organizationId: 'organizationId',
  dueAt: 'dueAt',
  firstResponseAt: 'firstResponseAt',
  resolvedAt: 'resolvedAt',
  isLocked: 'isLocked',
  customFields: 'customFields',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  subject: 'subject',
  content: 'content',
  category: 'category',
  isFavorite: 'isFavorite',
  usageCount: 'usageCount',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CSATScalarFieldEnum = {
  id: 'id',
  rating: 'rating',
  comment: 'comment',
  ticketId: 'ticketId',
  userId: 'userId',
  createdAt: 'createdAt',
  organizationId: 'organizationId'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  isInternal: 'isInternal',
  ticketId: 'ticketId',
  authorId: 'authorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  filename: 'filename',
  url: 'url',
  mimeType: 'mimeType',
  size: 'size',
  ticketId: 'ticketId',
  commentId: 'commentId',
  createdAt: 'createdAt'
};

exports.Prisma.TicketWatcherScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.TagScalarFieldEnum = {
  id: 'id',
  name: 'name',
  color: 'color',
  description: 'description',
  organizationId: 'organizationId',
  createdAt: 'createdAt'
};

exports.Prisma.TicketTagScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  tagId: 'tagId'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  link: 'link',
  isRead: 'isRead',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ActivityLogScalarFieldEnum = {
  id: 'id',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  userId: 'userId',
  ticketId: 'ticketId',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SavedViewScalarFieldEnum = {
  id: 'id',
  name: 'name',
  filters: 'filters',
  columns: 'columns',
  sortBy: 'sortBy',
  sortOrder: 'sortOrder',
  isDefault: 'isDefault',
  isShared: 'isShared',
  userId: 'userId',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ArticleScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  content: 'content',
  excerpt: 'excerpt',
  keywords: 'keywords',
  status: 'status',
  isPublished: 'isPublished',
  categoryId: 'categoryId',
  authorId: 'authorId',
  organizationId: 'organizationId',
  audience: 'audience',
  viewCount: 'viewCount',
  helpfulCount: 'helpfulCount',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ArticleCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  icon: 'icon',
  parentId: 'parentId',
  organizationId: 'organizationId',
  order: 'order',
  createdAt: 'createdAt'
};

exports.Prisma.ChatRoomScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  type: 'type',
  teamId: 'teamId',
  organizationId: 'organizationId',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChatRoomMemberScalarFieldEnum = {
  id: 'id',
  chatRoomId: 'chatRoomId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  content: 'content',
  chatRoomId: 'chatRoomId',
  senderId: 'senderId',
  receiverId: 'receiverId',
  replyToId: 'replyToId',
  isEdited: 'isEdited',
  isRead: 'isRead',
  attachmentUrl: 'attachmentUrl',
  attachmentName: 'attachmentName',
  attachmentType: 'attachmentType',
  attachmentSize: 'attachmentSize',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssetScalarFieldEnum = {
  id: 'id',
  assetTag: 'assetTag',
  name: 'name',
  type: 'type',
  manufacturer: 'manufacturer',
  model: 'model',
  serialNumber: 'serialNumber',
  status: 'status',
  organizationId: 'organizationId',
  location: 'location',
  department: 'department',
  assignedToId: 'assignedToId',
  assignedToName: 'assignedToName',
  purchaseDate: 'purchaseDate',
  purchasePrice: 'purchasePrice',
  warrantyExpiry: 'warrantyExpiry',
  vendor: 'vendor',
  poNumber: 'poNumber',
  specifications: 'specifications',
  notes: 'notes',
  barcodeData: 'barcodeData',
  barcodeFormat: 'barcodeFormat',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastAuditDate: 'lastAuditDate'
};

exports.Prisma.InviteCodeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  email: 'email',
  plan: 'plan',
  organizationId: 'organizationId',
  usedBy: 'usedBy',
  usedAt: 'usedAt',
  expiresAt: 'expiresAt',
  maxUses: 'maxUses',
  currentUses: 'currentUses',
  createdById: 'createdById',
  createdAt: 'createdAt',
  notes: 'notes',
  type: 'type',
  targetRole: 'targetRole'
};

exports.Prisma.JoinRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  organizationId: 'organizationId',
  inviteCodeId: 'inviteCodeId',
  status: 'status',
  message: 'message',
  reviewedBy: 'reviewedBy',
  reviewedAt: 'reviewedAt',
  createdAt: 'createdAt'
};

exports.Prisma.AccessLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  userEmail: 'userEmail',
  ipAddress: 'ipAddress',
  country: 'country',
  city: 'city',
  region: 'region',
  userAgent: 'userAgent',
  browser: 'browser',
  os: 'os',
  device: 'device',
  path: 'path',
  method: 'method',
  statusCode: 'statusCode',
  action: 'action',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.InventoryScalarFieldEnum = {
  id: 'id',
  sku: 'sku',
  name: 'name',
  category: 'category',
  quantity: 'quantity',
  minStock: 'minStock',
  price: 'price',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CalendarEventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  date: 'date',
  time: 'time',
  organizationId: 'organizationId',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RemoteSessionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  host: 'host',
  port: 'port',
  username: 'username',
  passwordHash: 'passwordHash',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Organization: 'Organization',
  Team: 'Team',
  TeamMember: 'TeamMember',
  Ticket: 'Ticket',
  Template: 'Template',
  CSAT: 'CSAT',
  Comment: 'Comment',
  Attachment: 'Attachment',
  TicketWatcher: 'TicketWatcher',
  Tag: 'Tag',
  TicketTag: 'TicketTag',
  Notification: 'Notification',
  ActivityLog: 'ActivityLog',
  SavedView: 'SavedView',
  Article: 'Article',
  ArticleCategory: 'ArticleCategory',
  ChatRoom: 'ChatRoom',
  ChatRoomMember: 'ChatRoomMember',
  ChatMessage: 'ChatMessage',
  Asset: 'Asset',
  InviteCode: 'InviteCode',
  JoinRequest: 'JoinRequest',
  AccessLog: 'AccessLog',
  Inventory: 'Inventory',
  CalendarEvent: 'CalendarEvent',
  RemoteSession: 'RemoteSession'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
