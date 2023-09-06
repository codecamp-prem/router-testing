import { describe, expect, it } from "vitest";
import { renderRoute } from "../../test-setup/renderRoute";
import { screen } from "@testing-library/react";
import { addMockApiRouteHandler } from "../../test-setup/mockServer";
import { HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";

describe("Postlist Page", () => {
  it("Properly filters the post list based on filter inputs", async () => {
    const user = userEvent.setup();

    addMockApiRouteHandler("get", "/posts", ({ request }) => {
      const posts = [
        {
          id: 1,
          title: "first title",
          body: "first post body",
          userId: 1,
        },
        {
          id: 2,
          title: "Second title",
          body: "Second post body",
          userId: 2,
        },
      ];
      return HttpResponse.json(
        posts.filter((post) => {
          const searchParams = new URL(request.url).searchParams;
          const title = searchParams.get("q") || "";
          const userId = parseInt(searchParams.get("userId"));
          return (
            post.title.includes(title) &&
            (isNaN(userId) || post.userId === userId)
          );
        })
      );
    });

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

    renderRoute("/posts");
    //screen.debug();
    expect(await screen.findByText("first title")).toBeInTheDocument();
    expect(screen.getByText("Second title")).toBeInTheDocument();

    const queryInput = screen.getByLabelText("Query");
    const filterBtn = screen.getByText("Filter");
    await user.type(queryInput, "first");
    await user.click(filterBtn);

    expect(screen.getByText("first title")).toBeInTheDocument();
    expect(screen.queryByText("Second title")).not.toBeInTheDocument();
    expect(queryInput).toHaveValue("first");

    const userInput = screen.getByLabelText("Author");
    await user.selectOptions(userInput, "user two");
    await user.clear(queryInput);
    await user.click(filterBtn);

    expect(screen.queryByText("first title")).not.toBeInTheDocument();
    expect(screen.getByText("Second title")).toBeInTheDocument();
    expect(userInput).toHaveValue("2");
  });
});
