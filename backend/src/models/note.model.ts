import { Schema, model, Document, Types } from "mongoose";

export interface INote extends Document {
    organizationId: Types.ObjectId;
    leadId: Types.ObjectId;
    authorId: Types.ObjectId;

    content: string;

    createdAt: Date;
    updatedAt: Date;
}

const noteSchema = new Schema<INote>(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        leadId: {
            type: Schema.Types.ObjectId,
            ref: "Lead",
            required: true,
            index: true,
        },

        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

noteSchema.index({ leadId: 1, createdAt: -1 });

export const Note = model<INote>("Note", noteSchema);