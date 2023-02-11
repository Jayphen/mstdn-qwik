import { component$, Slot } from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";

import Header from "../components/header/header";

export const serverTimeLoader = loader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  const serverTime = serverTimeLoader.use();
  return (
    <>
      <main>
        <Header />
        <section>
          <Slot />
        </section>
      </main>
      <footer>
        <div>{serverTime.value.date}</div>
      </footer>
    </>
  );
});
