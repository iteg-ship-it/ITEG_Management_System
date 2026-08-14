/* eslint-disable react/prop-types */
import Header from "../sidebar/Header";

const PageNavbar = ({
  title,
  subtitle,
  badge,
  onBack,
  onBackClick,
  rightContent = null,
  children,
  showBackButton,
  showBack,
  breadcrumbs = [],
  bottomRow = null,
  backPath
}) => {
  return (
    <Header
      title={title}
      subtitle={subtitle}
      badge={badge}
      onBack={onBack}
      onBackClick={onBackClick}
      backPath={backPath}
      showBack={showBack !== undefined ? showBack : showBackButton}
      breadcrumbs={breadcrumbs}
      bottomRow={bottomRow}
    >
      {rightContent || children}
    </Header>
  );
};

export default PageNavbar;