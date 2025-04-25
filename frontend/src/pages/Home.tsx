export default function Home() {
  const buttonClass =
    "bg-gray-900 text-white py-3 px-6 rounded-lg shadow hover:bg-gray-800 transition";

  return (
    <div className="px-6 py-8">
      {/* Быстрые действия */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className={buttonClass}>РАСПИСАНИЕ</button>
          <button className={buttonClass}>ДОКУМЕНТЫ</button>
          <button className={buttonClass}>НАГРУЗКА</button>
        </div>
      </section>

      {/* Новости */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Новости</h2>
        <ul className="space-y-4">
          <li className="border-b pb-2">Новость 1</li>
          <li className="border-b pb-2">Новость 2</li>
          <li className="border-b pb-2">Новость 3</li>
        </ul>
      </section>
    </div>
  );
}