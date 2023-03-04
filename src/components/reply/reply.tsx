import { component$, useSignal } from "@builder.io/qwik";
import { action$, Form, z, zod$ } from "@builder.io/qwik-city";
import { createClient } from "~/lib/mastodon";
import { useLoggedIn } from "~/routes/layout";

export const useCreateReply = action$(
  async (form, ev) => {
    const client = await createClient(ev);

    const result = await client.v1.statuses.create({
      inReplyToId: form.tootId || ev.params.id,
      status: form.post,
    });

    return result;
  },
  zod$({
    post: z.string().min(1),
    tootId: z.string(),
  })
);

export const Reply = component$((props: { tootId: string }) => {
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
            <input type="hidden" name="tootId" value={props.tootId} />
            <button type="submit" disabled={action.isRunning}>
              Reply
            </button>
          </Form>
        </>
      ) : null}
    </>
  );
});
