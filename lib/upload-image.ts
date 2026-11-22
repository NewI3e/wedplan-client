export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UploadError"
  }
}

/** Uploads an image and returns the URL the server assigned to it. */
export async function uploadImage(file: File, endpoint: string) {
  const body = new FormData()
  body.append("file", file)

  let response: Response

  try {
    response = await fetch(endpoint, { method: "POST", body })
  } catch {
    throw new UploadError("Could not upload the photo. Please try again.")
  }

  if (!response.ok) {
    let message = "Could not upload the photo."

    try {
      const payload = (await response.json()) as { error?: string }
      if (payload.error) message = payload.error
    } catch {
    }

    throw new UploadError(message)
  }

  const payload = (await response.json()) as { id?: string }

  if (!payload.id) throw new UploadError("Could not upload the photo.")

  return `${endpoint}/${payload.id}`
}
