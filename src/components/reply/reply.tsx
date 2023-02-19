import { component$, useSignal } from "@builder.io/qwik";
import { action$, Form, z, zod$ } from "@builder.io/qwik-city";
import { createClient } from "~/lib/mastodon";
import { useLoggedIn } from "~/routes/layout";

export const useCreateReply = action$(
  async (form, ev) => {
    const client = await createClient(ev.cookie, ev.params.instance);

    const result = await client.v1.statuses.create({
      inReplyToId: ev.params.id,
      status: form.post,
    });

    return result;
  },
  zod$({
    post: z.string().min(1),
  })
);

export const Reply = component$(() => {
  const loggedin = useLoggedIn();
  const action = useCreateReply();
  const formRef = useSignal<HTMLFormElement>();

  return (
    <>
      {loggedin.value ? (
        <>
          <Form
            action={action}
            ref={formRef}
            onSubmit$={() => formRef.value?.reset()}
          >
            <h3>Leave a reply</h3>
            <textarea name="post" disabled={action.isRunning} />
            <button type="submit" disabled={action.isRunning}>
              Reply
            </button>
          </Form>
        </>
      ) : null}
    </>
  );
});
