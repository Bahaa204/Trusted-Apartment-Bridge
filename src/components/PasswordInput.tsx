import { useRef, useState, type ComponentProps } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { EyeClosedIcon, EyeIcon } from "lucide-react";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

export default function PasswordInput({
  onChange: InputChange,
  ...props
}: PasswordInputProps) {
  const [Check, setCheck] = useState<boolean>(false);
  const [Render, setRender] = useState<boolean>(false);
  const InputRef = useRef<HTMLInputElement>(null);

  function handleRender() {
    setRender(InputRef.current?.value !== "");
  }

  return (
    <div className="relative w-full!">
      <Input
        ref={InputRef}
        type={`${Check ? "text" : "password"}`}
        onChange={(event) => {
          handleRender();
          InputChange!(event);
        }}
        {...props}
        className="w-full! pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
      />

      {Render && (
        <Button
          onClick={() => setCheck((prev) => !prev)}
          type="button"
          className="absolute right-2 cursor-pointer p-0!"
          variant="link"
        >
          {Check ? (
            <EyeClosedIcon className="size-5" />
          ) : (
            <EyeIcon className="size-5" />
          )}
        </Button>
      )}
    </div>
  );
}
