
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
  fileId: string[],
  validTopics: string[],
  invalidTopics: string[]

}

export type dataRequire = {
  assistantName: String
  assistantModel: String,
  assistantDescription: String,
  assistantToken: String
};
export type datallama = {
  assistantName: String
  assistantModel: String,
  assistantDescription: String,
}

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
export type dataGetConversation = {
  bot:string
  user: string | null
  Time: Date | null
}