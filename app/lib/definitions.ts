
export type User = {
  email: string;
  password: string;
};

export type datafichero = {
  ficherohash: String,
  ficheroId: String,
  ficheroName: String
};

export type dataBot = {
  Id: String
  name: String
  ai: String,
  token: String,
  role: String,
  fileId: string[]

}
export type dataRequire = {
  assistantName: String
  assistantModel: String,
  assistantDescription: String,
  assistantToken: String
};

export type  dataMessage = {
  threadId: string
  input: string
};

export type dataConversation = {
  student: string
  bot: string
  Time:Date
  question: string
  answer: string
}