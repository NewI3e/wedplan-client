import { handleImageUpload } from "@/lib/image-uploads"

export function POST(request: Request) {
  return handleImageUpload(request)
}
