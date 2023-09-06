import { describe, expect, it, vi } from "vitest";
import { renderRoute } from "../../test-setup/renderRoute";
import { screen } from "@testing-library/react";
import { addMockApiRouteHandler } from "../../test-setup/mockServer";
import { HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";

describe("NewPost Page", () => {
  it("should create a new post with valid inputs", async () => {
    const user = userEvent.setup();

    addMockApiRouteHandler("get", "/users", () => {
      return HttpResponse.json([
        {
          id: 1,
          name: "user one",
        },
        {
          id: 2,
          name: "user two",
        },
      ]);
    });

    const newPostApiHandler = vi.fn(async ({ request }) => {
      const bodyJson = await request.json();
      //console.log(bodyJson); // { title: 'new post', body: 'new post body', userId: '1' }

      const title = bodyJson.title;
      const userId = bodyJson.userId;
      const body = bodyJson.body;
      const id = 1;

      addMockApiRouteHandler("get", `/posts/${id}`, () => {
        return HttpResponse.json({ id, title, userId, body });
      });

      addMockApiRouteHandler("get", `/users/${userId}`, () => {
        return HttpResponse.json({ id: userId, name: "user one" });
      });

      addMockApiRouteHandler("get", `/posts/${id}/comments`, () => {
        return HttpResponse.json([]);
      });

      return HttpResponse.json({ id, title, userId, body });
    });
    addMockApiRouteHandler("post", "/posts", newPostApiHandler);

    renderRoute("/posts/new");

    const titleInput = await screen.findByLabelText("Title");
    const userInput = screen.getByLabelText("Author");
    const bodyInput = screen.getByLabelText("Body");

    const title = "new post";
    const userName = "user one";
    const body = "new post body";

    await user.type(titleInput, title);
    await user.selectOptions(userInput, userName);
    await user.type(bodyInput, body);
    await user.click(screen.getByText("Save"));
    //screen.debug();

    expect(newPostApiHandler).toHaveBeenCalledOnce();
    expect(screen.getByText("new post")).toBeInTheDocument();
    expect(screen.getByText("user one")).toBeInTheDocument();
    expect(screen.getByText("new post body")).toBeInTheDocument();
  });
});
