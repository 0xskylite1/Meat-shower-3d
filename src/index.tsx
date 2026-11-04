import { Composition, registerRoot } from "remotion";
import { Gate3D } from "./Gate3D";

const Root = () => (
  <Composition
    id="Gate3D"
    component={Gate3D}
    durationInFrames={90}
    fps={30}
    width={540}
    height={960}
  />
);

registerRoot(Root);
