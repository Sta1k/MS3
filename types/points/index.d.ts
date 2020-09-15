type Point = {
  _id: string,
  name: string;
  geolocation?: {
    lat: number,
    lng: number
  },
  finance: {
    total: number,
    current_day: number,
    spent: number,
    bonuses: number,
    encashment: number,
    [key: string]: number
  },
  remote_key: string,
  users: string[],
  GMT: number,
  currency: string,
  groups?: Group[],
  parameters?: Param[]
};