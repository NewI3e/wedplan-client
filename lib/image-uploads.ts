import { Binary, ObjectId } from "mongodb"

import { auth } from "@/lib/auth"
import { MAX_UPLOAD_BYTES, UPLOAD_TYPES, imageUploads } from "@/lib/uploads"

/** POST handler shared by every image upload route. */
export async function handleImageUpload(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return Response.json({ error: "Please sign in first." }, { status: 401 })
  }

  let form: FormData

  try {
    form = await request.formData()
  } catch {
    return Response.json(
      { error: "Could not read the uploaded file." },
      { status: 400 }
    )
  }

  const file = form.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Please choose an image." }, { status: 400 })
  }

  if (!UPLOAD_TYPES.includes(file.type as (typeof UPLOAD_TYPES)[number])) {
    return Response.json(
      { error: "Please choose a JPG, PNG or WebP image." },
      { status: 415 }
    )
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json(
      { error: "Please choose an image under 5 MB." },
      { status: 413 }
    )
  }

  const bytes = new Uint8Array(await file.arrayBuffer())

  try {
    const { insertedId } = await imageUploads().insertOne({
      contentType: file.type,
      size: file.size,
      data: new Binary(bytes),
      createdAt: new Date(),
    })

    return Response.json({ id: insertedId.toString() })
  } catch {
    return Response.json(
      { error: "Could not save the photo. Please try again." },
      { status: 500 }
    )
  }
}

/** GET handler that streams a stored image back to the browser. */
export async function handleImageGet(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  if (!ObjectId.isValid(id)) {
    return new Response("Not found", { status: 404 })
  }

  const image = await imageUploads().findOne(
    { _id: new ObjectId(id) },
    { projection: { contentType: 1, data: 1 } }
  )

  if (!image) {
    return new Response("Not found", { status: 404 })
  }

  // The URL never changes for a given upload, so it is safe to cache hard.
  return new Response(new Uint8Array(image.data.value()), {
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.data.length()),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
