import { NextResponse } from "next/server"

const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File size should be less than 5MB" }, { status: 400 })
  }
  const bytes = Buffer.from(await file.arrayBuffer())
  return NextResponse.json({
    contentType: file.type || "application/octet-stream",
    name: file.name,
    pathname: file.name,
    url: `data:${file.type || "application/octet-stream"};base64,${bytes.toString("base64")}`,
  })
}
