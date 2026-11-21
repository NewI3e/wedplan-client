import { handleImageGet } from "@/lib/image-uploads"

export function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return handleImageGet(request, context)
}
