import ResetPasswordForm from "../forms/ResetPasswordForm";

const ResetPasswordSection = ({ token }: TProps) => {
  return <ResetPasswordForm token={token} />;
};

export default ResetPasswordSection;

type TProps = {
  token?: string;
};
