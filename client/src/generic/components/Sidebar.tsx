import { CSSProperties } from 'react';

export interface Element {
  key?: string; // override react's key if necessary
  id: string;
  name: string;
  style?: CSSProperties;
  notification?: { content: string; style: CSSProperties };
}

interface SidebarProps {
  elements?: Element[];
  clickHandler: (id: string) => void;
  position: 'left' | 'right';
  header: string;
}

const Sidebar = ({ elements, clickHandler, position, header }: SidebarProps) => {
  const sidebarPositionStyle: CSSProperties = {
    [position]: 0, // Dynamic positioning based on props
    position: 'fixed',
    top: 0
  };

  return (
    <div className="sidebar" style={sidebarPositionStyle}>
      <h2>{header}</h2>
      <ul className="list">
        {elements?.map((element) => (
          <li
            key={element.key ?? element.id}
            style={element.style}
            onClick={() => clickHandler(element.id)}
            className="listItem">
            {element.name}
            {element.notification && (
              <span style={element.notification.style}>{element.notification.content}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
