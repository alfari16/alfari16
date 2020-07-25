export default `
<svg fill="none" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
            <style>
                *{
                    margin: 0;
                    box-sizing: border-box;
                    font-family: sans-serif
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
                .container{
                    height: 20px;
                    display: flex;
                    align-items:center;
                    justify-content: center;
                }
                h1 {
                    font-size: 20px;
                    background: linear-gradient(-45deg, #fc5c7d, #6a82fb, #05dfd7);
                    color: transparent;
                    background-clip: text;
                    -webkit-background-clip: text;
                    background-size: 100% 400%;
                    display: inline-block;
                    line-height: .8;
                    text-transform: uppercase;
                    animation: gradientBackground 10s ease infinite;
                }
            </style>
            <div class="container">
                <h1>X</h1>
            </div>
        </div>
    </foreignObject>
</svg>
`;
