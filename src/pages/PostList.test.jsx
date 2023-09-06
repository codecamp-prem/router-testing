import { describe, expect, it } from "vitest";
import { renderRoute } from "../../test-setup/renderRoute";
import { screen } from "@testing-library/react";
import { addMockApiRouteHandler } from "../../test-setup/mockServer";
import { HttpResponse } from "msw";

describe("Postlist Page", () => {
  it("works", async () => {
    addMockApiRouteHandler("get", "/posts", ({ request }) => {
      return HttpResponse.json([
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
      ]);
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
  });
});
