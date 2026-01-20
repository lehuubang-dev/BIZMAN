import { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface MenuItem {
  id: number;
  label: string;
  iconName: IconName;
  bgColor: string;
  iconColor: string;
}
