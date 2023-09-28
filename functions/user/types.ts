interface IUser {
  name: string;
  color: string;
}
type ResponseNewUser = {
  type: "newUser";
  data: {
    name: string;
    color: string;
    x: number;
    y: number;
  };
};

type ResponseRemoveUser = {
  type: "removeUser";
  data: {
    name: string;
    color: string;
    x: number;
    y: number;
  };
};

type ResponseMove = {
  type: "move";
  data: {
    name: string;
    x: number;
    y: number;
    color: string;
  };
};

type ResponseAllCoordinates = {
  type: "allCoordinates";
  data: {
    name: string;
    color: string;
    x: number;
    y: number;
  }[];
};

export {
  IUser,
  ResponseNewUser,
  ResponseRemoveUser,
  ResponseAllCoordinates,
  ResponseMove,
};
