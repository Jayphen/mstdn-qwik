import { component$, Slot } from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";

import Header from "../components/header/header";

export const serverTimeLoader = loader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useLoggedIn = loader$(async (ev) => {
  const token = ev.cookie.get("token")?.value;

  return token ? true : false;
});

export default component$(() => {
  const serverTime = serverTimeLoader();
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
