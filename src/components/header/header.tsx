import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import styles from "./header.css?inline";

export default component$(() => {
  useStylesScoped$(styles);
  const loc = useLocation();

  return (
    <header>
      <ul>
        <li>
          <a href={`/${loc.params.instance}/public`}>Public feed</a>
        </li>
      </ul>
    </header>
  );
});
