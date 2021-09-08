import React from 'react';
import { useI18n } from "react-intl";
import { Button, Toast, Popover } from 'components';

const Comp = props => {
  const {
    t
  } = useI18n();

  const tips = () => {
    Toast.info(t("tips"));
    Toast({
      text: t("tips")
    });
  };

  return <div>
      <Button onClick={tips}>{t("btn")}</Button>
      <Popover tooltip={t("popover")} />
    </div>;
};

export default Comp;