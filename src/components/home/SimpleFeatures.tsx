import { BlueCheck } from "../icons/Icons";

export default function SimpleFeatures() {
  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
        <div className="lg:col-span-7">
          <div className="grid grid-cols-12 gap-2 sm:gap-6 items-center lg:-translate-x-10">
            <div className="col-span-4">
              <img className="rounded-xl" src="/images/feature3.avif" alt="Image Description" />
            </div>

            <div className="col-span-3">
              <img className="rounded-xl" src="/images/feature2.jfif" alt="Image Description" />
            </div>

            <div className="col-span-5">
              <img className="rounded-xl" src="/images/feature1.jfif" alt="Image Description" />
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-10 lg:mt-0 lg:col-span-5">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2 md:space-y-4">
              <h2 className="font-bold text-3xl lg:text-4xl text-gray-800 dark:text-gray-200">
                Herramientas que facilitan el proceso de votación
              </h2>
              <p className="text-gray-500">
                Con nuestras herramientas podrás votar en segundos, sin problemas, ni largos procesos burocráticos.
              </p>
            </div>

            <ul role="list" className="space-y-2 sm:space-y-4">
              <li className="flex space-x-3">
                <BlueCheck />

                <span className="text-sm sm:text-base text-gray-500">
                  <span className="font-bold">Más fácil</span> – más eficiente
                </span>
              </li>

              <li className="flex space-x-3">
                <BlueCheck />
                <span className="text-sm sm:text-base text-gray-500">
                  Datos en tiempo real
                </span>
              </li>

              <li className="flex space-x-3">
                <BlueCheck />

                <span className="text-sm sm:text-base text-gray-500">
                  Seguridad <span className="font-bold">garantizada</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
