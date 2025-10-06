import z from "zod"

export const SignUpSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  type: z.enum(["user", "admin"]),
})

export const SignInSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
})

export const UpdateMetadataSchema = z.object({
  avatarId: z.string().email().optional(),
})

export const GetBulkMetadataSchema = z.object({
  userIds:z
    .string()
    .transform((val) => {
      const trimmed = val.trim().replace(/^\[|\]$/g, '');
      return trimmed.split(',').map(id => id.trim());
    })
    .refine((arr) => Array.isArray(arr) && arr.every(id => typeof id === 'string'), {
      message: 'ids must be an array of strings',
    }),
})

export const CreateSpaceSchema = z.object({
  name: z.string().min(1),
  // Dimensions as a string, minimum 10x10
  dimensions: z.string().regex(/^(?:[1-9][0-9]|100)x(?:[1-9][0-9]|100)$/, {
    message: "dimensions must be in the format 'WxH' where W and H are between 10 and 100",
  }),
  mapId: z.string().optional(),
})

export const AddElementSchema = z.object({
    elementId: z.string(),
    spaceId: z.string(),
    x: z.number().min(0),
    y: z.number().min(0),
})

export const CreateElementSchema = z.object({
    imageUrl: z.string().url(),
    height: z.number().min(1),
    width: z.number().min(1),
    static: z.boolean(),
})

export const UpdateElementSchema = z.object({
    imageUrl: z.string().url(),
})

export const DeleteElementSchema = z.object({
    elementId: z.string(),
})

export const CreateAvatarScheme = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url(),
})

export const CreateMapSchema = z.object({
  thumbnail: z.string(),
  name: z.string().min(1),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  elements: z.array(
    z.object({
        elementId: z.string(),
        x: z.number().min(0),
        y: z.number().min(0),
        })
    )
})

declare global {
  namespace Express{
    interface Request {
      userId?: string; // Optional userId for authenticated requests
      role?: "Admin" | "User"; // Optional role for authenticated requests
    }
  }
}