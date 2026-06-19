import { Section, Text } from "react-email";

import { EMAIL_THEME } from "../../theme";

export function BrandLogo() {
  return (
    <Section style={{ margin: 0 }}>
      <table role="presentation" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: EMAIL_THEME.brandSurface,
                color: EMAIL_THEME.primary,
                textAlign: "center",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              W
            </td>
            <td style={{ paddingLeft: 12 }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: EMAIL_THEME.text,
                }}
              >
                {EMAIL_THEME.brand}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
