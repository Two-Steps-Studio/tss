import { NextResponse } from "next/server";
import { uploadGameImage, validateFile } from "@/lib/supabase-storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'thumbnail' | 'banner' | 'screenshot';
    const gameId = formData.get('gameId') as string;

    if (!file || !type || !gameId) {
      return NextResponse.json(
        { error: "Brakujące wymagane pola: file, type, gameId" },
        { status: 400 }
      );
    }

    // Validate file
    validateFile(file, 'image');

    // Upload file
    const result = await uploadGameImage(type, gameId, file);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Plik został przesłany pomyślnie",
    });
  } catch (error: any) {
    console.error("[API] Upload games error:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd podczas przesyłania pliku" },
      { status: 500 }
    );
  }
}
