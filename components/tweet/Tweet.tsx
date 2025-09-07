import { Tweet as TweetComponent } from "react-tweet";

export function Tweet({ id }: { id: string }) {
  return <TweetComponent id={id} />;
}
