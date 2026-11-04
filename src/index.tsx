import { Composition, registerRoot } from "remotion";
import { Gate3D } from "./Gate3D";
import { MeatProof } from "./MeatProof";

const Root = () => (
  <>
    <Composition
      id="Gate3D"
      component={Gate3D}
      durationInFrames={90}
      fps={30}
      width={540}
      height={960}
    />
    <Composition
      id="MeatProof"
      component={MeatProof}
      durationInFrames={330}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

registerRoot(Root);
