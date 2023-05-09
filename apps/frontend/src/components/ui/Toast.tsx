import { Transition } from "@headlessui/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { toast } from "react-hot-toast";

export const showErrorToast = (message: string) => {
  toast.custom(
    (t) => (
      <Transition
        appear={true}
        as={Fragment}
        show={t.visible}
        unmount={false}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
          <div className="p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <XCircleIcon
                  className="h-8 w-8 text-red-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    ),
    { position: "bottom-right", duration: 2500 }
  );
};

export const showSuccessToast = (message: string) =>
  toast.custom(
    (t) => (
      <Transition
        appear={true}
        as={Fragment}
        show={t.visible}
        unmount={false}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
          <div className="p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <CheckCircleIcon
                  className="h-8 w-8 text-indigo-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{message}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    ),
    { position: "bottom-right", duration: 2500 }
  );
