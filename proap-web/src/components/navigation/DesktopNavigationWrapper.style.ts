import styled from '@emotion/styled';

interface DesktopNavigationListProps {
  width: number;
}

interface DesktopNavigationChildrenWrapperProps {
  navigationWidth: number;
}

export const DesktopNavigationContainer = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #f5f5f5;
`;

export const DesktopNavigationListWrapper = styled.div<DesktopNavigationListProps>`
  width: ${({ width }) => width}px;
  background-color: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  height: 100vh;
  position: fixed;
  overflow-y: auto;
  z-index: 100;
`;

export const DesktopNavigationHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #f0f0f0;
`;

export const ImgLogo = styled.img`
  height: 40px;
  margin-right: 1rem;
`;

export const DesktopNavigationChildrenWrapper = styled.div<DesktopNavigationChildrenWrapperProps>`
  min-height: 100vh;
  width: calc(100% - ${({ navigationWidth }) => navigationWidth}px);
  
  margin-left: ${({ navigationWidth }) => navigationWidth}px;
  
  background-color: #f5f5f5;
  
  overflow-x: hidden; 
  box-sizing: border-box;
`;

export const DesktopNavigationChildrenInner = styled.div`
  padding: 1.5rem;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;
