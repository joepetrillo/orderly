import {
  Dispatch,
  FormEvent,
  Fragment,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

type ModalProps = {
  title: string;
  actionTitle: string;
  loading: boolean;
  handleSubmit: (
    e: FormEvent<HTMLFormElement>,
    setOpen: (value: SetStateAction<boolean>) => void
  ) => Promise<void>;
  setError?: Dispatch<SetStateAction<string>>;
  children: React.ReactNode;
};

export default function Modal({
  title,
  actionTitle,
  loading,
  handleSubmit,
  setError,
  children,
}: ModalProps) {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const submitAndClose = (e: FormEvent<HTMLFormElement>) =>
    handleSubmit(e, setOpen);

  return (
    <>
      <Button
        onClick={() => {
          if (setError) setError("");
          setOpen(true);
        }}
      >
        {actionTitle}
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          className="relative z-20"
          initialFocus={cancelButtonRef}
          onClose={() => {
            if (!loading) setOpen(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                <Dialog.Panel className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white text-left text-gray-950 shadow-xl transition-all">
                  <fieldset disabled={loading}>
                    <form onSubmit={submitAndClose}>
                      <div className="bg-white px-4 py-6 sm:px-6">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold leading-6"
                        >
                          {title}
                        </Dialog.Title>
                        <div className="mt-5">{children}</div>
                      </div>
                      <div className="flex justify-center gap-2 bg-gray-100 px-4 py-3 sm:px-6">
                        <Button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="w-full"
                          ref={cancelButtonRef}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                        <Button className="w-full" type="submit">
                          {actionTitle}
                          {loading && <Spinner small />}
                        </Button>
                      </div>
                    </form>
                  </fieldset>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
