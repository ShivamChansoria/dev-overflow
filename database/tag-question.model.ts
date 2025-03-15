import { Schema, model, models, Types } from "mongoose";
//For fetching information based on tags.

export interface ITagQuestion {
  tag: Types.ObjectId;
  question: Types.ObjectId;
}

const TagQuestionSchema = new Schema<ITagQuestion>(
  {
    tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  },
  { timestamps: true }
);

const TagQuestion =
  models?.TagQuestion || model<ITagQuestion>("TagQuestion", TagQuestionSchema);

export default TagQuestion;
