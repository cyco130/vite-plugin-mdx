import { createSignal } from "solid-js";
import Sample from "./Sample.mdx";

export default function App() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <h1>Test</h1>
      <Sample />
      <p>
        <button type="button" onClick={() => setCount((count) => count + 1)}>
          Clicked: {count()}
        </button>
      </p>
    </>
  );
}
