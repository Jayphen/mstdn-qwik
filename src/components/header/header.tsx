import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import styles from "./header.css?inline";

export default component$(() => {
  useStylesScoped$(styles);
  const loc = useLocation();

  return (
    <header>
      <span>
        You're viewing the {loc.params.instance}{" "}
        {loc.pathname.includes("local") ? "local" : "public"} feed.
      </span>
      <ul>
        <li>
          <a href={`/${loc.params.instance}/public`}>Public feed</a>
          <a href={`/${loc.params.instance}/local`}>Local feed</a>
        </li>
      </ul>
    </header>
  );
});
