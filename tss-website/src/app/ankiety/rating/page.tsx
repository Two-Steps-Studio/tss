import { RatingInteraction } from "@/components/Rating"

export default function Page() {
  const handleRatingChange = (value: number) => {
    console.log("Ocena:", value)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Oceń Two Steps Studio 🎮
        </h1>

        <RatingInteraction onChange={handleRatingChange} />
      </div>
    </main>
  )
}