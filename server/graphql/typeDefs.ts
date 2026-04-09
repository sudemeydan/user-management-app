const typeDefs = `#graphql
  type User {
    id: Int!
    email: String!
    name: String
    username: String!
    age: Int
    address: String
    role: String!
    isEmailVerified: Boolean!
    isPrivate: Boolean!
    createdAt: String!
    profile: Profile
    profileImage: ProfileImage
    posts: [Post!]!
    cvs: [CV!]!
    sentConnections: [Connection!]!
    receivedConnections: [Connection!]!
  }

  type Profile {
    id: Int!
    bio: String
    phone: String
    userId: Int!
  }

  type ProfileImage {
    id: Int!
    url: String!
    fileId: String!
    userId: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: Int!
    content: String
    authorId: Int!
    author: User!
    images: [PostImage!]!
    createdAt: String!
  }

  type PostImage {
    id: Int!
    url: String!
    fileId: String!
    postId: Int!
    createdAt: String!
  }

  type CV {
    id: Int!
    fileName: String!
    fileId: String!
    fileSize: Int!
    mimeType: String!
    isActive: Boolean!
    status: JobStatus!
    rawText: String
    summary: String
    atsFormatScore: Int
    atsFormatFeedback: String
    userId: Int!
    user: User!
    entries: [CVEntry!]!
    createdAt: String!
    updatedAt: String!
  }

  type CVEntry {
    id: Int!
    cvId: Int!
    category: EntryCategory!
    title: String!
    subtitle: String
    startDate: String
    endDate: String
    description: String
    metadata: String
    createdAt: String!
  }

  type Connection {
    id: Int!
    senderId: Int!
    sender: User!
    receiverId: Int!
    receiver: User!
    status: String!
    createdAt: String!
  }

  enum JobStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
  }

  enum EntryCategory {
    CONTACT_INFO
    EXPERIENCE
    EDUCATION
    SKILL
    PROJECT
    LANGUAGE
    CERTIFICATE
    OTHER
  }

  type Query {
    users(skip: Int = 0, take: Int = 10): [User!]!
    user(id: Int!): User
    posts(skip: Int = 0, take: Int = 10): [Post!]!
    post(id: Int!): Post
    cvs(skip: Int = 0, take: Int = 10): [CV!]!
    cv(id: Int!): CV
    connections(skip: Int = 0, take: Int = 10): [Connection!]!
  }
`;

export default typeDefs;
