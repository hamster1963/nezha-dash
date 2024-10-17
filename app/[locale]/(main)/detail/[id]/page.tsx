export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
      {params.id}
    </div>
  );
}
