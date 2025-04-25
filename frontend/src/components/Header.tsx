export default function Header() {
  return (
    <header className="bg-[#e7edf5] text-gray-900 shadow px-4 py-4 grid grid-cols-3 items-center">
      {/* Логотип */}
      <div className="flex justify-start">
        <img src="/logo_dku.png" alt="Логотип DKU" className="h-8 sm:h-10 lg:h-14 w-auto" />
      </div>

      {/* Заголовок */}
      <div className="text-center text-xl sm:text-2xl font-bold">
        Информационный деканат
      </div>

      {/* Личный кабинет */}
      <div className="flex justify-end text-base sm:text-lg cursor-pointer hover:underline">
        Личный кабинет
      </div>
    </header>
  );
}