export default (isWinner = false) => `
<svg fill="none" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
	<foreignObject width="100%" height="100%">
		<div xmlns="http://www.w3.org/1999/xhtml">
			<style>
                *{
                    margin: 0;
                    box-sizing: border-box;
                    font-family: sans-serif
                }
				@keyframes rotate {
					0% {
						transform: translateY(-3px);
					}
					100% {
						transform: translateY(3px);
					}
				}
				@keyframes gradientBackground {
					0% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
					100% {
						background-position: 0% 50%;
					}
				}
				.flex{
					align-items:center;
					justify-content: center;
					position: relative;
				}
				.container{
					height: 80px;
					display: flex;
				}
				h1 {
					font-size: 80px;
					background: linear-gradient(-45deg, #d50000, #C51162, #AA00FF);
					color: transparent;
					background-clip: text;
					-webkit-background-clip: text;
					background-size: 100% 400%;
					display: inline-block;
					line-height: .8;
					text-transform: uppercase;
					animation: rotate ease-in-out 1s infinite alternate, gradientBackground 10s ease infinite;
				}
				.winner{
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%) rotate(-15deg);
					border-radius: 5px;
					color: white;
					font-size: 14px;
					font-weight: bold;
					width: 80px;
					background: #d50000;
					text-align: center;
				}
			</style>
				<div class="container flex">
						<h1>O</h1>
						${
              isWinner
                ? '<span class="winner flex bg">WINNER!<br/>Click to reset</span>'
                : ''
            }
				</div>
		</div>
	</foreignObject>
</svg>
`;
